import xml.etree.ElementTree as ET
import re

def get_svg_viewbox_params(root, filename):
    """
    Intelligently determines the viewBox parameters (min_x, min_y, width, height) of an SVG.
    """
    print(f"--- Analyzing {filename} ---")
    viewBox = root.get('viewBox')
    if viewBox:
        print(f"Found viewBox attribute: '{viewBox}'")
        try:
            parts = [float(p) for p in viewBox.split()]
            if len(parts) == 4:
                print(f"-> Parsed as: min_x={parts[0]}, min_y={parts[1]}, width={parts[2]}, height={parts[3]}")
                return parts[0], parts[1], parts[2], parts[3]
        except (ValueError, IndexError):
            print("-> Could not parse viewBox.")
            pass

    width_str = root.get('width')
    height_str = root.get('height')
    print(f"Found width='{width_str}', height='{height_str}'")
    if width_str and height_str:
        width_val = re.match(r'[\d.]+', width_str)
        height_val = re.match(r'[\d.]+', height_str)
        if width_val and height_val:
            dims = (0, 0, float(width_val.group(0)), float(height_val.group(0)))
            print(f"-> Using width/height to construct viewBox: min_x={dims[0]}, min_y={dims[1]}, width={dims[2]}, height={dims[3]}")
            return dims

    print("-> Falling back to default 100x100 dimensions.")
    return 0, 0, 100, 100  # Fallback

def combine_svgs(svg1_path, svg2_path, output_path):
    """
    Combines two SVGs side-by-side, printing diagnostic information.
    """
    ET.register_namespace('', "http://www.w3.org/2000/svg")

    try:
        tree1 = ET.parse(svg1_path)
        root1 = tree1.getroot()
        tree2 = ET.parse(svg2_path)
        root2 = tree2.getroot()
    except (ET.ParseError, FileNotFoundError) as e:
        print(f"FATAL ERROR: Could not parse SVG files. Error: {e}")
        return

    min_x1, min_y1, orig_w1, orig_h1 = get_svg_viewbox_params(root1, svg1_path)
    min_x2, min_y2, orig_w2, orig_h2 = get_svg_viewbox_params(root2, svg2_path)

    # Define layout for the output SVG
    total_width = 800
    graph_height = 370
    header_height = 30
    total_height = graph_height + header_height
    graph_width = total_width / 2

    combined_svg = ET.Element('svg', {'width': str(total_width), 'height': str(total_height), 'version': '1.1'})
    label_y = str(header_height - 10)
    ET.SubElement(combined_svg, 'text', {'x': str(graph_width / 2), 'y': label_y, 'font-size': '20px', 'text-anchor': 'middle', 'fill': 'black'}).text = 'graf G1'
    ET.SubElement(combined_svg, 'text', {'x': str(graph_width * 1.5), 'y': label_y, 'font-size': '20px', 'text-anchor': 'middle', 'fill': 'black'}).text = 'graf G2'

    print("\n--- Calculating Transforms ---")
    # --- Process first SVG ---
    scale1 = min(graph_width / orig_w1, graph_height / orig_h1) if orig_w1 > 0 and orig_h1 > 0 else 1
    trans_x1 = (graph_width - (orig_w1 * scale1)) / 2
    trans_y1 = header_height + (graph_height - (orig_h1 * scale1)) / 2
    transform1 = f'translate({trans_x1}, {trans_y1}) scale({scale1}) translate({-min_x1}, {-min_y1})'
    print(f"Transform for {svg1_path}: {transform1}")
    g1 = ET.SubElement(combined_svg, 'g', {'transform': transform1})
    for child in root1:
        g1.append(child)

    # --- Process second SVG ---
    scale2 = min(graph_width / orig_w2, graph_height / orig_h2) if orig_w2 > 0 and orig_h2 > 0 else 1
    trans_x2 = graph_width + (graph_width - (orig_w2 * scale2)) / 2
    trans_y2 = header_height + (graph_height - (orig_h2 * scale2)) / 2
    transform2 = f'translate({trans_x2}, {trans_y2}) scale({scale2}) translate({-min_x2}, {-min_y2})'
    print(f"Transform for {svg2_path}: {transform2}")
    g2 = ET.SubElement(combined_svg, 'g', {'transform': transform2})
    for child in root2:
        g2.append(child)

    final_tree = ET.ElementTree(combined_svg)
    final_tree.write(output_path, encoding='unicode', xml_declaration=True)
    print(f"\nSuccessfully wrote to {output_path}")

if __name__ == '__main__':
    combine_svgs('g1.svg', 'g2.svg', 'combined.svg')
