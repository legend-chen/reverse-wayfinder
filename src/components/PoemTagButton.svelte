/* components/PoemTagButton.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	add_render_callback,
	append,
	attr,
	bubble,
	component_subscribe,
	create_in_transition,
	create_out_transition,
	detach,
	element,
	init,
	insert,
	listen,
	safe_not_equal,
	set_data,
	space,
	text,
	toggle_class
} from "svelte/internal";

import { localize, language } from "../util/locale.js";
import haikuTag from "../assets/image/ui/ico_haiku.png";
import haikuTagLeaf from "../assets/image/ui/ico_haiku_leaf.png";
import { emptyTransition } from "../animations/transitions.js";

function create_fragment(ctx) {
	let div1;
	let img0;
	let img0_src_value;
	let t0;
	let div0;
	let img1;
	let img1_src_value;
	let t1;
	let p;
	let t2_value = /*$localize*/ ctx[4].journalTitle + "";
	let t2;
	let div1_intro;
	let div1_outro;
	let current;
	let mounted;
	let dispose;

	return {
		c() {
			div1 = element("div");
			img0 = element("img");
			t0 = space();
			div0 = element("div");
			img1 = element("img");
			t1 = space();
			p = element("p");
			t2 = text(t2_value);
			if (img0.src !== (img0_src_value = haikuTag)) attr(img0, "src", img0_src_value);
			attr(img0, "alt", "Haiku Tag");
			attr(img0, "class", "haiku-tag svelte-n0azwu");
			if (img1.src !== (img1_src_value = haikuTagLeaf)) attr(img1, "src", img1_src_value);
			attr(img1, "alt", "Haiku Tag Leaf");
			attr(img1, "class", "haiku-tag-leaf svelte-n0azwu");
			attr(p, "class", "haiku-tag-text svelte-n0azwu");
			attr(div0, "class", "haiku-tag-text-container svelte-n0azwu");
			attr(div1, "class", "haiku-tag-container svelte-n0azwu");
			toggle_class(div1, "button", /*button*/ ctx[0]);
			toggle_class(div1, "useMargin", /*useMargin*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, img0);
			append(div1, t0);
			append(div1, div0);
			append(div0, img1);
			append(div0, t1);
			append(div0, p);
			append(p, t2);
			current = true;

			if (!mounted) {
				dispose = listen(div1, "click", /*click_handler*/ ctx[5]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if ((!current || dirty & /*$localize*/ 16) && t2_value !== (t2_value = /*$localize*/ ctx[4].journalTitle + "")) set_data(t2, t2_value);

			if (dirty & /*button*/ 1) {
				toggle_class(div1, "button", /*button*/ ctx[0]);
			}

			if (dirty & /*useMargin*/ 8) {
				toggle_class(div1, "useMargin", /*useMargin*/ ctx[3]);
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (div1_outro) div1_outro.end(1);
				if (!div1_intro) div1_intro = create_in_transition(div1, /*inTransition*/ ctx[1], {});
				div1_intro.start();
			});

			current = true;
		},
		o(local) {
			if (div1_intro) div1_intro.invalidate();
			div1_outro = create_out_transition(div1, /*outTransition*/ ctx[2], {});
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (detaching && div1_outro) div1_outro.end();
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $localize;
	component_subscribe($$self, localize, $$value => $$invalidate(4, $localize = $$value));
	let { button = true } = $$props;
	let { inTransition = emptyTransition } = $$props;
	let { outTransition = emptyTransition } = $$props;
	let { useMargin = true } = $$props;

	function click_handler(event) {
		bubble($$self, event);
	}

	$$self.$$set = $$props => {
		if ("button" in $$props) $$invalidate(0, button = $$props.button);
		if ("inTransition" in $$props) $$invalidate(1, inTransition = $$props.inTransition);
		if ("outTransition" in $$props) $$invalidate(2, outTransition = $$props.outTransition);
		if ("useMargin" in $$props) $$invalidate(3, useMargin = $$props.useMargin);
	};

	return [button, inTransition, outTransition, useMargin, $localize, click_handler];
}

class PoemTagButton extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			button: 0,
			inTransition: 1,
			outTransition: 2,
			useMargin: 3
		});
	}
}

export default PoemTagButton;